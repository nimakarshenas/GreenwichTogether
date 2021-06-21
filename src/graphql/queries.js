/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getBlogNew = /* GraphQL */ `
  query GetBlogNew($id: ID!) {
    getBlogNew(id: $id) {
      id
      title
      content
      description
      date
      image
      createdAt
      updatedAt
      area
    }
  }
`;
export const listBlogNews = /* GraphQL */ `
  query ListBlogNews(
    $filter: ModelBlogNewFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBlogNews(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        description
        date
        image
        createdAt
        updatedAt
        area
      }
      nextToken
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        channelID
        author
        body
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getChannel = /* GraphQL */ `
  query GetChannel($id: ID!) {
    getChannel(id: $id) {
      id
      value
      label
      appId
      token
      users
      createdAt
      updatedAt
    }
  }
`;
export const listChannels = /* GraphQL */ `
  query ListChannels(
    $filter: ModelChannelFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChannels(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        value
        label
        appId
        token
        users
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const blogsByDate = /* GraphQL */ `
  query BlogsByDate(
    $area: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBlogNewFilterInput
    $limit: Int
    $nextToken: String
  ) {
    blogsByDate(
      area: $area
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        description
        date
        image
        createdAt
        updatedAt
        area
      }
      nextToken
    }
  }
`;
export const messagesByChannelId = /* GraphQL */ `
  query MessagesByChannelId(
    $channelID: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByChannelID(
      channelID: $channelID
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        channelID
        author
        body
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
