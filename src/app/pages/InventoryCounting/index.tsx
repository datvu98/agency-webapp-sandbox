import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { InventoryCountingList, InventoryCountingDetail } from "./Loadable";
import LayoutInventoryCounting from './components/Layout'

const InventoryCountingPage = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="list" replace />} />
            <Route
              path={"list"}
              element={
                <LayoutInventoryCounting>
                  <InventoryCountingList />
                </LayoutInventoryCounting>
              }
            />
      <Route path=":id" element={<InventoryCountingDetail />} />
    </Routes>
  );
};

export default InventoryCountingPage;
