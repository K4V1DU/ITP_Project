import React, { useState } from "react";
import Products from "./products";
import "./ProductList.css";

function ProductList({ products }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFlavours, setSelectedFlavours] = useState([]);
  const [SearchWord, Search] = useState("");

  // Item is tempory variable hold Catogory value in each loop
  const categories = [
    ...new Set(products.map((Item) => Item.Category).filter(Boolean)),
  ];
  const flavours = [
    ...new Set(products.map((Item) => Item.Flavour).filter(Boolean)),
  ];

  //ItemSelect check clickedItem is in SelectedItems and change state using setItems function
  const ItemSelect = (ClickedItem, SelectedItems, setItems) => {
    setItems(
      SelectedItems.includes(ClickedItem)
        ? SelectedItems.filter((Item) => Item !== ClickedItem)
        : [...SelectedItems, ClickedItem]
    );
  };

  //check items are in selected list if not remove it

  const filteredProducts = products.filter(
    (p) =>
      (selectedCategories.length === 0 ||
        selectedCategories.includes(p.Category)) &&
      (selectedFlavours.length === 0 || selectedFlavours.includes(p.Flavour)) &&
      (p.Name.toLowerCase().includes(SearchWord.toLowerCase()) ||
        p.Description.toLowerCase().includes(SearchWord.toLowerCase()) ||
        p.ProductID.toLowerCase().includes(SearchWord.toLowerCase()))
  );

  return (
    <div className="main">
      <div className="sidebar">
        <div>
          <h2>Categories</h2>
          {categories.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(item)}
                onChange={() =>
                  ItemSelect(item, selectedCategories, setSelectedCategories)
                }
              />
              {item}
            </label>
          ))}
        </div>

        <div style={{ marginTop: "15px" }}>
          <h2>Flavours</h2>
          {flavours.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={selectedFlavours.includes(item)}
                onChange={() =>
                  ItemSelect(item, selectedFlavours, setSelectedFlavours)
                }
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="rightSide">
        <div className="SearchBar">
          <div className="searchBox">
            <input
              type="text"
              placeholder="Search products"
              value={SearchWord}
              onChange={(e) => Search(e.target.value)}
            />
            <svg
              className="searchIcon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
        </div>

        <div className="Products">
          {filteredProducts.map((product, i) => (
            <Products key={i} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
