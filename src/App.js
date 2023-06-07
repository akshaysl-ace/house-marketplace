import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";
import Explore from "./pages/Explore";
import ForgotPasswordPage from "./pages/ForgotPassword";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Category from "./pages/Category";
import CreateNewListing from "./pages/CreateNewListing";
import Listing from "./pages/Listing";
import Contact from "./pages/Contact";
import EditListing from "./pages/EditListing";

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/create-listing" element={<CreateNewListing />} />
          <Route path="/edit-listing/:listingId" element={<EditListing />} />
          <Route path="/contact/:landlordId" element={<Contact />} />
          <Route path="/category/:categoryName/:listingId" element={<Listing />} />
        </Routes>
        <NavBar />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
