import React, { memo } from "react";
// import PropTypes from "prop-types";

import { Routes , Route } from "react-router-dom";

import ProtectedRoute from "../utils/ProtectedRoute";

// Pages
import Dashboard from "../pages/Dashboard";
import Token from "../pages/Token";
import TokenInfo from "../pages/Token/TokenInfo";
import Login from "../pages/Auth/Login";
import ChangePassword from "../pages/Auth/ChangePassword";
import Stake from "../pages/Stake";
import StakeInfo from "../pages/Stake/StakeInfo";
import Order from "../pages/Order";
import Trade from "../pages/Trade";


const Routing = () => {
    // const { selectLanding } = props;

    return (
        <Routes>
            <Route path="/login" element={< Login />} />
            {/* <Route element={<ProtectedRoute />}> */}
                <Route path="/" element={< Dashboard/>} />
                <Route path="/changepassword" element={< ChangePassword/>} />
                <Route path="/dashboard" element={< Dashboard/>} />
                <Route path="/token" element={< Token />} />
                <Route path="/tokeninfo" element={< TokenInfo />} />

                <Route path="/stake" element={< Stake />} />
                <Route path="/stakeinfo" element={< StakeInfo />} />

                <Route path="/order" element={< Order />} />
                <Route path="/trade" element={< Trade />} />
            {/* </Route> */}
        </Routes>
    );
}

Routing.propTypes = {
    // selectLanding: PropTypes.func.isRequired,
};

export default memo(Routing);
