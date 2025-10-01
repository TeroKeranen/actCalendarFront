import { Routes, Route, Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { requireAuth } from "./lib/auth";


import {
  HomeLayout,
  ActCreateCardholder,
  CalendarCreate,
  // CalendarSetup,
  PublicCalendar,
  SignIn,
  SignUp,
  Welcome,
  Error,
  Landing,
  CreatedCalendars,
  RootLayout,
  ActAdminpage
} from './pages'

//actions
import {action as signinAction} from "./pages/SignIn"
import {action as registerAction} from './pages/SignUp'
import {action as welcomeAction} from './pages/Welcome'
import {action as createcalendar} from './pages/calendarCreate'
import {store} from './store'

//loader
import { loader as createdCalendars } from "./pages/createdCalendars";
import {loader as actAdminLoader} from "./pages/ActAdminPage"



const router = createBrowserRouter([


  {
    path: "/",
    element: <RootLayout />,       // Header näkyy AINA
    errorElement: <Error />,
    children: [
      { index: true, element: <Landing /> },                // Landing oletuksena
      { path: "signin", element: <SignIn />, action: signinAction(store) },
      { path: "signup", element: <SignUp />, action: registerAction },
      { path: "c/:slug", element: <PublicCalendar /> },     // julkinen kalenteri

      // Suojattu app-alue
      {
        path: "app",
        element: <HomeLayout />,
        loader: requireAuth,
        children: [
          { index: true, element: <Welcome />, action: welcomeAction },
          { path: "createcardholder", element: <ActCreateCardholder /> },
          { path: "calendarcreate", element: <CalendarCreate />, action: createcalendar },
          // { path: "calendarsetup", element: <CalendarSetup /> },
          { path: "calendars", element: <CreatedCalendars />, loader: createdCalendars },
          {path: "actadmin", element: <ActAdminpage />, loader: actAdminLoader}
        ],
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
}


export default App;
// export default function App() {
//   return (
//     <>
//     <Navbar />
//     <main >

//     <Routes>
//       <Route path="/" element={<Navigate to="/signing" />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/signing" element={<Signing />} />
//       <Route path="/welcome" element={<Welcome />} />
//       <Route path="/act/cardholders/new" element={<ActCreateCardholder />} />
//       <Route path="/calendar/setup" element={<CalendarSetup />} />
//       <Route path="/calendar/door" element={<DoorCalendar />} />
//       <Route path="/calendar/new" element={<CalendarCreate />} />
//       <Route path="/c/:slug" element={<PublicCalendar />} />
//     </Routes>
//     </main>
//     </>
//   );
// }
