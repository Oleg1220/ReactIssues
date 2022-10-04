import Profile from "views/pages/crew/Profile";
import Location from "views/pages/system-administration/location/Location";
const otherRoutes = [
    {
      path: "/profile",
      component: Profile,
      layout: "/admin",
    },
    {
      path: "/location/:id",
      component: Location,
      layout: "/admin",
    }
];

export default otherRoutes;