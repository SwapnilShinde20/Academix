import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {store,  persistor } from './store/store.js'
import { Provider, useSelector } from 'react-redux'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import {createBrowserRouter} from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import Home from './pages/HOD/HodHome.jsx'
import ClassroomHomePage from './components/classroom/ClassroomHomePage.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import Viewclassroom from './components/classroom/Viewclassroom.jsx'
import Noticeboard from './components/noticeboard/Noticeboard.jsx'
import Attendance from './components/attendance/attendance.jsx'
import ExamPage from './components/exam/ExamPage.jsx'
import Timetable from './components/timeTable/Timetable.jsx'
import { PersistGate } from 'redux-persist/integration/react'

const router = createBrowserRouter([
  {
    path:"/",
    element:<App/>,
    children:[
      {
        path:"/",
        element:(
            <LoginPage/>
        )
      },
      {
        path:"/home",
        element:(
          <AuthLayout authentication>
            <Home/>
          </AuthLayout>
        )
      },
      {
        path:"/signup",
        element:(
          <AuthLayout authentication={false}>
            <SignupPage/>
          </AuthLayout>
        )
      },

      {
        //path:"/add-faculty" 
        path:"/classroom",
        element:(
          <AuthLayout authentication>
            <ClassroomHomePage/>
          </AuthLayout>
        )
      },
      {
        path:"/class/:classId",
        element:(
          <AuthLayout authentication>
            <Viewclassroom/>
          </AuthLayout>
        )
      },
      {
        path:"/notice",
        element:(
          <AuthLayout authentication>
            <Noticeboard/>
          </AuthLayout>
        )
      },
      {
        path:"/attendance",
        element:(
          <AuthLayout authentication>
          <Attendance/>
        </AuthLayout>
        )
      },
      {
        path:"/exam-result",
        element:(
          <AuthLayout authentication>
          <ExamPage/>
        </AuthLayout>
        )
      },
      {
        path:"/timetable",
        element:(
          <AuthLayout authentication>
          <Timetable/>
        </AuthLayout>
        )
      },
      {
        path:"/homework",
        element:(
          <AuthLayout authentication>
          <Home/>
        </AuthLayout>
        )
      },
      
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <RouterProvider router={router}/>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
