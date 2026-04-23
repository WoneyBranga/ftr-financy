import { gql } from '@apollo/client'

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($data: CreateTransactionInput!) {
    createTransaction(data: $data) {
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

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $data: UpdateTransactionInput!) {
    updateTransaction(id: $id, data: $data) {
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

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`
