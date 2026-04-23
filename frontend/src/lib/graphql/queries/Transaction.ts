import { gql } from '@apollo/client'

export const LIST_TRANSACTIONS = gql`
  query Transactions {
    transactions {
      id
      description
      amount
      type
      date
      categoryId
      category {
        id
        name
        color
      }
      createdAt
      updatedAt
    }
  }
`
