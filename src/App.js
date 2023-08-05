import React, { useState } from "react";
import ProductTable from "./ProductTable";
import LoginScreen from "./LoginScreen";
import "./App.css"; // Add your custom CSS here

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <div>
          {/* <h1>Product Table</h1> */}
          <ProductTable />
        </div>
      )}
    </div>
  );
}

export default App;
