import { useGlobalSliceSlice } from "app/slice";
import React, { memo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { ReportProvider } from "app/contexts/ReportContext";
import ReportOverview from "./ReportOverview";
import { FullfillmentProvider } from "app/contexts/FullfillmentContext";
import FullfillmentReport from "../Fullfillment/FullfillmentReport";
import ConversionBillListPage from "./ConversionBills";
import ConversionBillDetailPage from "./ConversionBills/ConversionBillDetailPage";

export const ReportPage = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="operation" replace />} />
            <Route
                path={"overview"}
                element={
                    <ReportProvider>
                        <ReportOverview />
                    </ReportProvider>
                }
            />
            <Route
                path={"fullfillment-report"}
                element={
                    <FullfillmentProvider>
                        <FullfillmentReport />
                    </FullfillmentProvider>
                }
            />
            <Route path={"conversion-bills"} element={<ConversionBillListPage />} />
            <Route path={"conversion-bills/:bill_code"} element={<ConversionBillDetailPage />} />
        </Routes>
    );
}
