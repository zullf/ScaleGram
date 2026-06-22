export const createPostUsecases = (postRepository) => ({
  searchPostsByTag: async (tag) => {
    return await postRepository.searchPostsByTag(tag);
  },
});
