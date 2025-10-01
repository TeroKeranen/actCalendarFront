import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { listSites, listDoors, listCardholderGroups } from "../../lib/api"


// --- normalisoijat ---
const normalizeSites = (resp) => {
    const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.sites || []);
    return (arr || [])
      .map(s => ({ id: Number(s.SiteID ?? s.siteid ?? s.ID ?? s.Id ?? s.id),
                   name: String(s.Name ?? s.SiteName ?? s.name ?? `Site ${s.SiteID ?? s.ID ?? "?"}`)}))
      .filter(x => Number.isFinite(x.id));
  };
  const normalizeDoors = (resp) => {
    const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.doors || []);
    return (arr || [])
      .map(d => ({ id: Number(d.DoorID ?? d.ID ?? d.Id ?? d.id),
                   name: String(d.Name ?? d.DoorName ?? d.name ?? `Door ${d.DoorID ?? d.ID ?? "?"}`)}))
      .filter(x => Number.isFinite(x.id));
  };
  const normalizeCHG = (resp) => {
    const arr = resp?.items || [];
    return (arr || [])
      .map(g => ({ id: Number(g.id ?? g.ID ?? g.GroupID),
                   name: String(g.name ?? g.Name ?? `Group ${g.id ?? g.ID}`)}))
      .filter(x => Number.isFinite(x.id));
  };

  // YKSI vakio tyhjä taulukko -> sama viite aina
const EMPTY = Object.freeze([]);

  // apuri: jaa lista pieniin eriin (vähentää “piikkikuormaa”)
const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  // Lataa KERRALLA: sites + jokaiselle sitelle doors & groups
export const bootstrapTenant = createAsyncThunk(
    "tenant/bootstrap",
    async ({ tenantId, token }, { rejectWithValue }) => {
      try {
        const sitesRaw = await listSites(tenantId, token);
        const sites = normalizeSites(sitesRaw);
  
        const doorsBySiteId = {};
        const groupsBySiteId = {};
  
        // hae 3 siteä rinnakkain kerralla (rajoitettu rinnakkaisuus)
        for (const pack of chunk(sites, 3)) {
          const results = await Promise.all(pack.map(async (s) => {
            const [dResp, gResp] = await Promise.all([
              listDoors(tenantId, s.id, token),
              listCardholderGroups(tenantId, s.id, token),
            ]);
            return { siteId: s.id, doors: normalizeDoors(dResp), groups: normalizeCHG(gResp) };
          }));
          results.forEach(r => {
            doorsBySiteId[r.siteId] = r.doors;
            groupsBySiteId[r.siteId] = r.groups;
          });
        }
  
        return { sites, doorsBySiteId, groupsBySiteId, loadedAt: Date.now() };
      } catch (e) {
        return rejectWithValue(e?.message || "Bootstrap failed");
      }
    }
  );

  const initialState = {
    sites: [],
    doorsBySiteId: {},
    groupsBySiteId: {},
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    loadedAt: null,
  };

  const tenantSlice = createSlice({
    name: "tenant",
    initialState,
    reducers: {
      clearTenant: () => initialState,
    },
    extraReducers: (builder) => {
      builder
        .addCase(bootstrapTenant.pending, (state) => { state.status = "loading"; state.error = null; })
        .addCase(bootstrapTenant.fulfilled, (state, { payload }) => {
          state.status = "succeeded";
          state.sites = payload.sites;
          state.doorsBySiteId = payload.doorsBySiteId;
          state.groupsBySiteId = payload.groupsBySiteId;
          state.loadedAt = payload.loadedAt;
        })
        .addCase(bootstrapTenant.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload || action.error?.message;
        });
    }
  });
  
  export const { clearTenant } = tenantSlice.actions;
  export default tenantSlice.reducer;
  
  // --- selektorit ---
  export const selectSites = (state) => state.tenant.sites || EMPTY;

  // apurit: raaka-mapit
  const selectDoorsMap = (state) => state.tenant.doorsBySiteId || {};
  const selectGroupsMap = (state) => state.tenant.groupsBySiteId || {};
  // parametri (siteId) normalisoituna stringiksi
  const selectSiteKey = (_state, siteId) => String(siteId ?? "");

  // tehdään SELECTOR FACTORYT (kutsu kerran per komponentti)
  export const makeSelectDoorsForSite = () =>
    createSelector([selectDoorsMap, selectSiteKey], (map, key) => map[key] ?? EMPTY);

  export const makeSelectGroupsForSite = () =>
    createSelector([selectGroupsMap, selectSiteKey], (map, key) => map[key] ?? EMPTY);

  // export const selectDoorsForSite = (state, siteId) =>
  //   state.tenant.doorsBySiteId[Number(siteId)] || [];

  // export const selectGroupsForSite = (state, siteId) =>
  //   state.tenant.groupsBySiteId[Number(siteId)] || [];