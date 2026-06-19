import React from 'react'
import { Navigate, Route, Routes, Outlet } from 'react-router-dom'

import LayoutCampaign from './components/LayoutCampaign'
import ListCampaign from './ListCampaign/ListCampaign'
import EditCampaign from './ListCampainEdit/EditCampaign'
import CampaignRegister from './CampaignRegister/CampaignRegister'
import { JobDetail } from './Job'
import { CampaignWrapper as CampaignStyleWrapper } from './Campaign.styles'

const CampaignLayoutWrapper = () => {
    return (
        <LayoutCampaign>
            <CampaignStyleWrapper>
                <Outlet />
            </CampaignStyleWrapper>
        </LayoutCampaign>
    )
}

const CampaignPage = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="list-campaign" replace />} />

            <Route element={<CampaignLayoutWrapper />}>
                <Route path="list-campaign" element={<ListCampaign />} />
                <Route path="edit-campaign/:id" element={<EditCampaign />} />
                <Route path="/store/:id/register-campaign" element={<CampaignRegister />} />
                <Route path="job/:id" element={<JobDetail />} />
            </Route>
        </Routes>
    )
}

export default CampaignPage
