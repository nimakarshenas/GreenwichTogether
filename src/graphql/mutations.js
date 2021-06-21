/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createBlogNew = /* GraphQL */ `
  mutation CreateBlogNew(
    $input: CreateBlogNewInput!
    $condition: ModelBlogNewConditionInput
  ) {
    createBlogNew(input: $input, condition: $condition) {
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
export const updateBlogNew = /* GraphQL */ `
  mutation UpdateBlogNew(
    $input: UpdateBlogNewInput!
    $condition: ModelBlogNewConditionInput
  ) {
    updateBlogNew(input: $input, condition: $condition) {
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
export const deleteBlogNew = /* GraphQL */ `
  mutation DeleteBlogNew(
    $input: DeleteBlogNewInput!
    $condition: ModelBlogNewConditionInput
  ) {
    deleteBlogNew(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const createChannel = /* GraphQL */ `
  mutation CreateChannel(
    $input: CreateChannelInput!
    $condition: ModelChannelConditionInput
  ) {
    createChannel(input: $input, condition: $condition) {
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
export const updateChannel = /* GraphQL */ `
  mutation UpdateChannel(
    $input: UpdateChannelInput!
    $condition: ModelChannelConditionInput
  ) {
    updateChannel(input: $input, condition: $condition) {
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
export const deleteChannel = /* GraphQL */ `
  mutation DeleteChannel(
    $input: DeleteChannelInput!
    $condition: ModelChannelConditionInput
  ) {
    deleteChannel(input: $input, condition: $condition) {
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
