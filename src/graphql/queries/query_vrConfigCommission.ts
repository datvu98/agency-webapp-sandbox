import gql from 'graphql-tag';

export default gql`
  query vrConfigCommission($sme_id: Int!, $contract_id: Int!) {
  vrConfigCommission(sme_id: $sme_id, contract_id: $contract_id) {
    message
    success
    last_updated_at
    last_executed_at
    init {
      applied_indicator
      comparison_operators
    }
    settings {
      groups {
        formula_result
        stores
        formula_rules {
          applied_indicator
          comparison_operators
          operands
          stores
        }
      }
      extended_groups {
        formula_result
        stores
        formula_rules {
          applied_indicator
          comparison_operators
          operands
          stores
        }
      }
    }
  }
}

`;
