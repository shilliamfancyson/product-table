// src/ProductTable.js
import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import firebaseConfig from "./firebaseConfig";
import "./ProductTable.css"; // Import custom CSS for styling

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    column: "Price",
    direction: "asc",
  });

  useEffect(() => {
    firebase.initializeApp(firebaseConfig);

    const productsRef = firebase.database().ref("products");

    productsRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.values(data);

        // Sort the products based on the current sortOrder
        const sortedProducts = [...productList].sort((a, b) => {
          const column = sortOrder.column;
          const direction = sortOrder.direction === "asc" ? 1 : -1;
          return a[column] < b[column] ? -direction : a[column] > b[column] ? direction : 0;
        });

        setProducts(sortedProducts);
      }
    });

    return () => productsRef.off("value");
  }, [sortOrder]);

  const handleSort = (column) => {
    setSortOrder((prevSortOrder) => ({
      column,
      direction: prevSortOrder.column === column && prevSortOrder.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Function to format the timestamp into "last updated" string
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `Last Updated: ${date.toLocaleString()}`;
  };

  return (
    <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("Title")}>Title</th>
            <th onClick={() => handleSort("Price")}>Price</th>
            <th onClick={() => handleSort("Reviews")}>Reviews</th>
            <th onClick={() => handleSort("VideoCount")}>Video Count</th>
            <th onClick={() => handleSort("timestamp")}>Last Updated</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.ASIN}>
              <td>{product.Title}</td>
              <td>{product.Price}</td>
              <td>{product.Reviews}</td>
              <td>{product.VideoCount || "N/A"}</td>
              <td>{formatTimestamp(product.timestamp)}</td>
              <td>
                <a href={product.Link} target="_blank" rel="noopener noreferrer">
                  View on Amazon
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
