"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageTransition from "@/components/PageTransition";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useUser();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  const profile = useQuery(api.prompts.getUserProfile, { userId });
  const userPosts = useQuery(api.prompts.getUserCommunityPosts, { userId });
  const isFollowing = useQuery(
    api.prompts.isFollowing,
    currentUser && userId !== currentUser.id
      ? { followerId: currentUser.id, followingId: userId }
      : "skip"
  );
  const followers = useQuery(api.prompts.getFollowers, { userId });
  const following = useQuery(api.prompts.getFollowing, { userId });

  const followUser = useMutation(api.prompts.followUser);
  const unfollowUser = useMutation(api.prompts.unfollowUser);
  const updateProfile = useMutation(api.prompts.updateProfile);
  const getOrCreateProfile = useMutation(api.prompts.getOrCreateProfile);

  // Create profile if doesn't exist
  useEffect(() => {
    if (currentUser && userId === currentUser.id && !profile) {
      getOrCreateProfile({
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.username || "Anonymous",
        userAvatar: currentUser.imageUrl,
      });
    }
  }, [currentUser, userId, profile, getOrCreateProfile]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setWebsite(profile.website || "");
    }
  }, [profile]);

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      if (isFollowing) {
        await unfollowUser({ followerId: currentUser.id, followingId: userId });
      } else {
        await followUser({ followerId: currentUser.id, followingId: userId });
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    try {
      await updateProfile({
        userId: currentUser.id,
        bio,
        location,
        website,
      });
      setIsEditingBio(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const isOwnProfile = currentUser?.id === userId;

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">Loading profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/community">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <Link href="/app">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {profile.userAvatar ? (
                <img
                  src={profile.userAvatar}
                  alt={profile.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.userName[0].toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{profile.userName}</h1>
                  <p className="text-zinc-500 text-sm">@{userId.slice(0, 8)}</p>
                </div>
                {!isOwnProfile && currentUser && (
                  <Button
                    onClick={handleFollow}
                    className={
                      isFollowing
                        ? "bg-zinc-800 hover:bg-zinc-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
                {isOwnProfile && (
                  <Button
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    variant="outline"
                  >
                    {isEditingBio ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
              </div>

              {/* Bio Section */}
              {isEditingBio ? (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs text-zinc-500">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-zinc-950 border-zinc-800 mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 mt-1"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <>
                  {profile.bio && (
                    <p className="text-zinc-300 mb-3">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        📍 {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        🔗 {new URL(profile.website).hostname}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      📅 Joined {formatDate(profile.joinDate)}
                    </span>
                  </div>
                </>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <span className="font-bold text-white">{profile.postCount}</span>{" "}
                  <span className="text-zinc-500">Posts</span>
                </div>
                <div className="cursor-pointer hover:underline">
                  <span className="font-bold text-white">
                    {profile.followerCount}
                  </span>{" "}
                  <span className="text-zinc-500">Followers</span>
                </div>
                <div className="cursor-pointer hover:underline">
                  <span className="font-bold text-white">
                    {profile.followingCount}
                  </span>{" "}
                  <span className="text-zinc-500">Following</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="bg-zinc-900 border-b border-zinc-800 w-full">
            <TabsTrigger value="posts" className="flex-1">
              Posts
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1">
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {userPosts?.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
                <p className="text-zinc-400">No posts yet</p>
              </Card>
            ) : (
              userPosts?.map((post) => (
                <Card
                  key={post._id}
                  className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">
                        Original Prompt
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-sm">
                        {post.originalPrompt}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                        Optimized Prompt
                        {post.scoreImprovement && (
                          <Badge className="bg-green-950 text-green-400 border-green-900 text-xs">
                            +{post.scoreImprovement.toFixed(1)} score
                          </Badge>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-blue-950/20 to-purple-950/20 p-3 rounded-lg border border-blue-900/30 text-sm">
                        {post.optimizedPrompt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800 text-sm text-zinc-500">
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.commentCount}</span>
                    <span>🔄 {post.repostCount}</span>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-3 mt-4">
            {followers?.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
                <p className="text-zinc-400">No followers yet</p>
              </Card>
            ) : (
              followers?.map((follower) => (
                <Card
                  key={follower?._id}
                  className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all"
                >
                  <Link href={`/profile/${follower?.userId}`}>
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                        {follower?.userAvatar ? (
                          <img
                            src={follower.userAvatar}
                            alt={follower.userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          follower?.userName[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{follower?.userName}</div>
                        <div className="text-sm text-zinc-500">
                          {follower?.postCount} posts
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-3 mt-4">
            {following?.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
                <p className="text-zinc-400">Not following anyone yet</p>
              </Card>
            ) : (
              following?.map((followedUser) => (
                <Card
                  key={followedUser?._id}
                  className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all"
                >
                  <Link href={`/profile/${followedUser?.userId}`}>
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                        {followedUser?.userAvatar ? (
                          <img
                            src={followedUser.userAvatar}
                            alt={followedUser.userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          followedUser?.userName[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {followedUser?.userName}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {followedUser?.postCount} posts
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </PageTransition>
  );
}
