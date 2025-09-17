import React, {useEffect, useState} from 'react';
import Navbar from '../NavBar/NavBar';
import axios from "axios";
import InventoryItem from '../Inventory/Inventory';

const URL = "http://localhost:5000/Inventory";

const fetchHandler = async () =>{
  return await axios.get(URL).then((res) => res.data);
}

function Inventory() {
  const [Inventory, setInventory] = useState([]);

  useEffect(()=> {
    fetchHandler().then((data) => setInventory(data.Inventory));
  },[])

  return (
    <div>
      <Navbar/>
      <div>
        {Inventory && Inventory.map ((items, i) => (
          <div key= {i}>
            <InventoryItem items={items}/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Inventory
