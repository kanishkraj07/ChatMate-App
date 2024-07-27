import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Signup } from "./components/Authentication/Signup";
import { Signin } from "./components/Authentication/Signin";
import { Home } from "./components/Home/Home";
import { ReactElement, useEffect } from "react";
import Chats from "./components/ChatsGround/Chats";
import Rooms from "./components/RoomsGround/Rooms";
import Groups from "./components/GroupsGround/Groups";
import FriendRequests from "./components/FriendRequestsGround/FriendRequests";
import { RecoilRoot } from "recoil";

interface RouteOptions {
  id: string;
  path: string;
  element: ReactElement;
  children?: RouteOptions[]
}

const App = () => {

  const routes: RouteOptions[] = [
    {id: 'signUp', path: '/signup', element: <Signup />},
    { id: 'signIn', path: '/signin', element: <Signin /> },
    { id: 'home', path: '/', element: <Home />, children: [
      {id: 'chats', path: 'chats', element: <Chats/> },
      {id: 'rooms', path: 'rooms', element: <Rooms/> },
      {id: 'groups', path: 'groups', element: <Groups/> },
      {id: 'community', path: 'community', element: <Chats/> },
      {id: 'friendrequests', path: 'requests', element: <FriendRequests/> },
    ] }];

  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          {routes.map((route: RouteOptions) => <Route key={route.id} path={route.path} element = {route.element}>
            {route.children?.map((childRoute: RouteOptions) => <Route key={childRoute.id} path={childRoute.path} element={childRoute.element}></Route>)}
          </Route>)}
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  )
}

export default App
