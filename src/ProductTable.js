// src/ProductTable.js
import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import firebaseConfig from "./firebaseConfig";
import "./ProductTable.css"; // Import custom CSS for styling

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const [sortOrder, setSortOrder] = useState({
    column: "Price",
    direction: "asc",
  });
  const [hideNullLinks, setHideNullLinks] = useState(false);
  const [hideMessaged, setHideMessaged] = useState(false);

  const totalProducts = products.length;

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

        // Filter products based on the hideNullLinks and hideMessaged states
        let filteredProducts = sortedProducts;
        if (hideNullLinks) {
          filteredProducts = sortedProducts.filter(
            (product) => product.SoldByLink !== "null" && product.hasOwnProperty("SoldByLink")
          );
        }
        if (hideMessaged) {
          filteredProducts = filteredProducts.filter(
            (product) => product.Messaged !== "Yes"
          );
        }

        setProducts(filteredProducts);
      }
    });

    return () => productsRef.off("value");
  }, [sortOrder, hideNullLinks, hideMessaged]);

  const handleSort = (column) => {
    setSortOrder((prevSortOrder) => ({
      column,
      direction: prevSortOrder.column === column && prevSortOrder.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDeleteProduct = (asin) => {
    const productsRef = firebase.database().ref("products");
    productsRef.child(asin).remove();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `Last Updated: ${date.toLocaleString()}`;
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleToggleMessaged = (asin, currentValue) => {
    const productsRef = firebase.database().ref("products");
    const newMessagedValue = currentValue === "Yes" ? "No" : "Yes";
    productsRef.child(asin).update({ Messaged: newMessagedValue });
  };

  const handleCopyTemplate = (template) => {
    const el = document.createElement("textarea");
    el.value = template;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Template copied to clipboard!");
  };

  return (
    <div className="product-table-center-container">
      <div className="product-table-container">
        <div className="total-products">Total Products: {totalProducts}</div>

        <div>
          <input
            type="checkbox"
            checked={hideNullLinks}
            onChange={() => setHideNullLinks((prev) => !prev)}
          />
          <label>Hide records with null Sold By Link</label>
        </div>

        <div>
          <input
            type="checkbox"
            checked={hideMessaged}
            onChange={() => setHideMessaged((prev) => !prev)}
          />
          <label>Hide Messaged Records</label>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("Title")}>Title</th>
              <th onClick={() => handleSort("Price")}>Price</th>
              <th onClick={() => handleSort("Reviews")}>Reviews</th>
              <th onClick={() => handleSort("VideoCount")}>Video Count</th>
              <th onClick={() => handleSort("timestamp")}>Last Updated</th>
              <th onClick={() => handleSort("Category")}>Category</th>
              <th>Link</th>
              <th>Delete</th>
              <th onClick={() => handleSort("Messaged")}>Messaged</th>
              <th>Template</th>
              <th>Sold by link</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.ASIN}>
                <td>{product.Title}</td>
                <td>{product.Price}</td>
                <td>{product.Reviews}</td>
                <td>{product.VideoCount || "N/A"}</td>
                <td>{formatTimestamp(product.timestamp)}</td>
                <td>{product.Category || "null"}</td>
                <td>
                  <a href={product.Link} target="_blank" rel="noopener noreferrer">
                    View on Amazon
                  </a>
                </td>
                <td>
                  <button onClick={() => handleDeleteProduct(product.ASIN)}>Delete</button>
                </td>
                <td>
                  {product.Messaged === null ? (
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleToggleMessaged(product.ASIN, "No")}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={product.Messaged === "Yes"}
                      onChange={() =>
                        handleToggleMessaged(product.ASIN, product.Messaged)
                      }
                    />
                  )}
                </td>
                <td>
                  {product.Template ? (
                    <button onClick={() => handleCopyTemplate(product.Template)}>
                      Copy
                    </button>
                  ) : (
                    "null"
                  )}
                </td>
                <td>
                  {product.SoldByLink && product.SoldByLink !== "null" ? (
                    <a href={product.SoldByLink} target="_blank" rel="noopener noreferrer">
                      link
                    </a>
                  ) : (
                    "null"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={indexOfLastProduct >= products.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
