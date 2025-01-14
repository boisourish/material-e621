import router from "@/router";
import { EnhancedPost } from "@/worker/ApiService";
import { getApiService } from "@/worker/services";
import { computed, ref, watch } from "vue";
import Vue from "vue";
import { useAccountStore, useSnackbarStore, useUrlStore } from "@/services";

interface IUsePostListManagerArgs {
  loadPosts(args: {
    postsBefore?: number | undefined;
    postsAfter?: number | undefined;
  }): Promise<EnhancedPost[]>;

  getSettingsPageSize(): number;

  getSavedFirstPostId(): number;
  saveFirstPostId(id: number | null): void;
}

export const usePostListManager = ({
  loadPosts,
  getSavedFirstPostId,
  saveFirstPostId,
  getSettingsPageSize,
}: IUsePostListManagerArgs) => {
  const snackbar = useSnackbarStore();
  const posts = ref<EnhancedPost[]>([]);
  const fullscreenPost = ref<EnhancedPost | null>(null);
  const detailsPost = ref<EnhancedPost | null>(null);
  const loading = ref(false);
  const urlStore = useUrlStore();

  const handleError = (error: any) => {
    const errorMessage = error?.message || String(error);
    snackbar.addMessage(errorMessage);
    console.log(error);
  };

  const setPostFavorite = async (args: {
    postId: number;
    favorited: boolean;
  }) => {
    const account = useAccountStore();
    const post = posts.value.find((p) => p.id === args.postId);
    if (!post) {
      return;
    }

    if (!account.auth) {
      snackbar.addMessage("Not logged in");
      const { appRouter } = await import("@/misc/util/router");
      appRouter.push({ name: "AccountSettings" });
      return;
    }
    const service = await getApiService();
    const serviceArgs = {
      postId: post.id,
      auth: account.auth,
      proxyUrl: urlStore.proxyUrl,
    };
    try {
      Vue.set(post.__meta, "isFavoriteLoading", true);
      if (args.favorited) {
        await service.favoritePost(serviceArgs);
      } else {
        await service.unfavoritePost(serviceArgs);
      }
      Vue.set(post, "is_favorited", args.favorited);
    } catch (error: any) {
      handleError(error);
    } finally {
      Vue.set(post.__meta, "isFavoriteLoading", false);
    }
  };

  const getPostCountToRemove = () => posts.value.length - getSettingsPageSize();

  const firstPostId = computed(() =>
    posts.value.length ? posts.value[0].id : getSavedFirstPostId(),
  );
  const lastPostId = computed(() =>
    posts.value.length
      ? posts.value[posts.value.length - 1].id
      : getSavedFirstPostId() + 1,
  );

  const loadPreviousPage = async () => {
    if (loading.value) {
      return console.log("loadPreviousPage called, but already loading");
    }
    try {
      loading.value = true;
      const newPosts = await loadPosts({
        postsAfter: firstPostId.value,
      });
      const postCountToRemove = getPostCountToRemove();
      posts.value.unshift(...newPosts);
      posts.value.splice(
        posts.value.length - postCountToRemove,
        postCountToRemove,
      );
    } catch (error) {
      handleError(error);
    } finally {
      loading.value = false;
    }
  };
  const loadNextPage = async () => {
    if (loading.value) {
      return console.log("loadNextPage called, but already loading");
    }
    try {
      loading.value = true;
      const newPosts = await loadPosts({
        postsBefore: lastPostId.value,
      });

      const postCountToRemove = getPostCountToRemove();
      posts.value.push(...newPosts);
      posts.value.splice(0, postCountToRemove);
    } catch (error) {
      handleError(error);
    } finally {
      loading.value = false;
    }
  };

  watch(
    posts,
    () => {
      saveFirstPostId(posts.value[0]?.id || null);
    },
    { deep: true },
  );

  const openPostDetails = (postId: number) => {
    detailsPost.value = posts.value.find((p) => p.id === postId) || null;
  };
  const isValidNextPost = (post: EnhancedPost) => {
    return !!post.file.url;
  };
  const _openFullscreenPost =
    (offset: number) =>
    async (postId: number, depth: number): Promise<boolean> => {
      // returns whether post has been opened successfully
      const idx = posts.value.findIndex((p) => p.id === postId);
      let nextPostIdx = idx;
      do {
        nextPostIdx += offset;
      } while (
        posts.value[nextPostIdx] &&
        !isValidNextPost(posts.value[nextPostIdx]) &&
        offset
      );
      const nextPost = posts.value[nextPostIdx];
      if (nextPost) {
        fullscreenPost.value = nextPost;
        return true;
      } else {
        if (offset > 0) {
          await loadNextPage();
        } else if (offset < 0) {
          await loadPreviousPage();
        }
        if (depth <= 0) {
          const success = await _openFullscreenPost(offset)(postId, depth + 1);
          if (!success) {
            fullscreenPost.value = null; // no further posts
          }
          return success;
        } else {
          return false;
        }
      }
    };

  const openFullscreenPost = _openFullscreenPost(0);
  const openNextFullscreenPost = () =>
    fullscreenPost.value?.id &&
    _openFullscreenPost(1)(fullscreenPost.value.id, 0);
  const openPreviousFullscreenPost = () =>
    fullscreenPost.value?.id &&
    _openFullscreenPost(-1)(fullscreenPost.value.id, 0);

  return {
    loadPreviousPage,
    loadNextPage,
    posts,
    fullscreenPost,
    detailsPost,
    loading,
    openPostDetails,
    openFullscreenPost,
    openNextFullscreenPost,
    openPreviousFullscreenPost,
    setPostFavorite,
  };
};
