export default class PostRepository {
  async getPosts(limit, lastVisible) {
    throw new Error('Method not implemented');
  }
  async getPostById(postId) {
    throw new Error('Method not implemented');
  }
  async uploadPost(postData, fileData) {
    throw new Error('Method not implemented');
  }
  async likePost(postId, userId) {
    throw new Error('Method not implemented');
  }
  async unlikePost(postId, userId) {
    throw new Error('Method not implemented');
  }
  async addComment(postId, commentData) {
    throw new Error('Method not implemented');
  }
  async getComments(postId) {
    throw new Error('Method not implemented');
  }
  async searchPosts(searchQuery) {
    throw new Error('Method not implemented');
  }
  async searchPostsByTag(tag) {
    throw new Error('Method not implemented');
  }
}
