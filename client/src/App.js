import React, { useEffect, useState } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import "./App.css";

import HomePage from "./pages/homepage/Homepage";
import ShopPage from "./pages/shop/Shop";
import Search from "./pages/search/Search";
import Header from "./components/header/Header";
import SignInOut from "./pages/signinout-page/SignInOut";
import CheckOut from "./pages/checkout/Checkout";

import { auth, createUserProfileDocument } from "./firebase/firebase-utils";
import { setCurrentUser } from "./redux/user/user-actions";
import {
  selectCurrentUser,
  selectIsUserAdmin,
} from "./redux/user/user-selectors";
import { Footer } from "./components/footer/Footer";
import Admin from "./pages/admin/Admin";

const App = ({ currentUser, setCurrentUser }) => {
  const [userLoading, setUserLoading] = useState({
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    let unsubscribeFromAuth = null;

    unsubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      //If user signs in
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot((snapShot) => {
          setUserLoading({ loading: false, isAdmin: snapShot.data().isAdmin });
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data(),
          });
        });
      }

      //No user or signing out => null data.
      else {
        setUserLoading({ loading: false, isAdmin: false });
        setCurrentUser(userAuth);
      }
    });

    //Closing subscription
    return () => {
      unsubscribeFromAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <Header />
      <Switch>
        <Route exact path={process.env.PUBLIC_URL + "/"} component={HomePage} />
        <Route path={process.env.PUBLIC_URL + "/shop"} component={ShopPage} />
        <Route
          exact
          path={process.env.PUBLIC_URL + "/checkout"}
          component={CheckOut}
        />
        <Route
          exact
          path={process.env.PUBLIC_URL + "/search/:searchQuery"}
          component={Search}
        />
        <Route
          exact
          path={process.env.PUBLIC_URL + "/signin"}
          render={() => {
            return currentUser ? (
              <Redirect to={process.env.PUBLIC_URL + "/"} />
            ) : (
              <SignInOut />
            );
          }}
        />
        <Route
          path={process.env.PUBLIC_URL + "/admin"}
          render={() =>
            userLoading.loading ? (
              <h1>Loading...</h1>
            ) : userLoading.isAdmin ? (
              <Admin />
            ) : (
              <Redirect to={process.env.PUBLIC_URL + "/"} />
            )
          }
        />
        <Route render={() => <Redirect to={process.env.PUBLIC_URL + "/"} />} />
      </Switch>
      <Footer />
    </div>
  );
};

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser,
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentUser: (user) => dispatch(setCurrentUser(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
