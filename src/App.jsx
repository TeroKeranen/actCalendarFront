import { Routes, Route, Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
// import Signup from "./pages/SignUp.jsx";
// import Signing from "./pages/SignIn.jsx";
// import Welcome from "./pages/Welcome.jsx";
// import ActCreateCardholder from "./pages/actCreateCardholder";
// import CalendarSetup from "./pages/calendarSetup";
// import DoorCalendar from "./pages/doorCalendar";
// import CalendarCreate from "./pages/calendarCreate";
// import PublicCalendar from "./pages/publicCalendar";
// import Navbar from "./components/Navbar.jsx";

import {
  HomeLayout,
  ActCreateCardholder,
  CalendarCreate,
  CalendarSetup,
  PublicCalendar,
  SignIn,
  SignUp,
  Welcome,
  Error,
  Landing,
  CreatedCalendars
} from './pages'

//actions
import {action as signinAction} from "./pages/SignIn"
import {action as registerAction} from './pages/SignUp'
import {action as welcomeAction} from './pages/Welcome'
import {action as createcalendar} from './pages/calendarCreate'
import {store} from './store'

//loader
import { loader as createdCalendars } from "./pages/createdCalendars";


const router = createBrowserRouter([
  {
    path:'/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing/>
      },
      {
        path: "welcome",
        element: <Welcome />,
        action: welcomeAction
      },
      {
        path:"createcardholder",
        element: <ActCreateCardholder />
      },
      
      {
        path:"calendarcreate",
        element: <CalendarCreate />,
        action: createcalendar
      },
      
      {
        path:"calendarSetup",
        element: <CalendarSetup />
      },
      {

        path:'c/:slug',
        element: <PublicCalendar />,
        errorElement: <Error />
      },
      {
        path:'calendars',
        element: <CreatedCalendars />,
        errorElement: <Error />,
        loader: createdCalendars
      }
      
    ]
  },
  {
    path:'/signin',
    element: <SignIn />,
    errorElement: <Error />,
    action: signinAction(store),
  },
  {
    path:'/signup',
    element: <SignUp />,
    errorElement: <Error />,
    action: registerAction
  },


])

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
