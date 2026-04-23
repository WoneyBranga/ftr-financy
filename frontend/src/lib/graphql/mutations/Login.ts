import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
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
