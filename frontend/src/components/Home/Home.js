import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductList from "./ProductList/ProductList"; 


const URL = "http://localhost:5000/inventory";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Home() {
  const [products, setProduct] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => setProduct(data.products));
  }, []);

  return (
    <div>
      
    
      {products && <ProductList products={products} />}


    </div>
  );
}

export default Home;