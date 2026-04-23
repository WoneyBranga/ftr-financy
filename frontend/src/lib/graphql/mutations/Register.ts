import { gql } from '@apollo/client'

export const REGISTER = gql`
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      token
      user {
        id
        name
        email
        createdAt
        updatedAt
      }
    }
  }
`
