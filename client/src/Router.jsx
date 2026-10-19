import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/home/Home.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import NotFoundPage from './pages/auth/NotFoundPage.jsx'
import SiteLayout from './components/SiteLayout.jsx'

import {createBrowserRouter, RouterProvider} from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      {path:"/", element:<Home />},
      {path:"/login", element:<Login />},
      {path:"/register", element:<Register />},
      {path:"*", element:<NotFoundPage />}
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
