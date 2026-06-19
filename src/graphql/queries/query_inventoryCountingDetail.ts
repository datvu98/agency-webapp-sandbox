import gql from "graphql-tag";

export default gql`
  query inventoryCountingDetail($input: InventoryCountingDetailInput!) {
    inventoryCountingDetail(input: $input) {
      success
      message
      data {
        id
        code
        status
        method
        note
        warehouseId
        warehouseName
        startedAt
        countedAt
        completedAt
        approvedById
        assignedToId
        cancelledById
        completedById
        createdById
        totalLocationRequest
        totalLocationCounted
        totalSkuRequest
        totalSkuCounted
        totalStockRequest
        totalStockCounted
        totalVariantDiff
        avgDiff
        totalItems
        currentPage
        sessions {
          id
          code
          sessionNumber
          status
          picId
          startedAt
          endedAt
        }
        items {
          id
          locationCode
          sku
          gtin
          productName
          unit
          session1SystemQty
          session1CountedQty
          session1Diff
          session1IsAnomaly
          session1AnomalyQty
          session1IsUnexpected
          session2SystemQty
          session2CountedQty
          session2Diff
          session2IsAnomaly
          session2AnomalyQty
          session2IsUnexpected
          session3SystemQty
          session3CountedQty
          session3Diff
          session3IsAnomaly
          session3AnomalyQty
          session3IsUnexpected
        }
      }
    }
  }
`;
