import { gql } from '@apollo/client'

export const LIST_CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`
