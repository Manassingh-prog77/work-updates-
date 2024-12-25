import type { Reply, Comment, IEventItem } from 'src/types/events';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Pagination from '@mui/material/Pagination';
import {
  Box,
  Link,
  Paper,
  Avatar,
  Button,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from '@mui/material';

import {paths} from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { uuidv4 } from '../../../utils/uuidv4';

type Props = {
  currentEvent: IEventItem;
};

export function Comments({ currentEvent }: Props) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(currentEvent.comments);
  const [replyText, setReplyText] = useState('');
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [replyVisibility, setReplyVisibility] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 2;

  const navigate = useNavigate();

  const handleUploadImage = () => {
    console.log('Image upload clicked');
  };

  const handleSelectEmoji = () => {
    console.log('Emoji picker clicked');
  };

  const handleLike = (commentId: string) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [commentId]: !prevLikes[commentId], // Toggle like
    }));
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !currentEvent) return;

    const newCommentObj: Comment = {
      id: uuidv4(),
      createdBy: currentEvent.createdBy,
      userId: currentEvent.createdBy.id,
      likes: 0,
      content: newComment,
      createdAt: dayjs(),
      replies: [],
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  const handleExpandThread = (commentId: string) => {
    console.log(commentId);
    navigate(paths.dashboard.comments(commentId))
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim() || !currentEvent) return;

    const addReply = (commentList: Comment[]): Comment[] =>
      commentList.map((comment) => {
        if (comment.id === parentId) {
          const newReply: Reply = {
            id: uuidv4(),
            commentId: parentId,
            userId: currentEvent.createdBy.id,
            createdBy: currentEvent.createdBy,
            content: replyText,
            createdAt: dayjs(),
            parentReplyId: parentId,
            replies: [],
            likes: 0,
          };

          return {
            ...comment,
            replies: [...(comment.replies ?? []), newReply],
          };
        }
        // Return the original comment if IDs do not match
        return comment;
      });

    setComments(addReply(comments));
    setReplyText('');
    setReplyingTo(null);
  };

  const handlePageChange = (event: any, value: number) => {
    setCurrentPage(value);
  };

  // Calculate the visible comments based on the current page
  const currentComments = comments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  const toggleReplyVisibility = (commentId: string) => {
    setReplyVisibility((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderComments = (commentList: Comment[], depth = 0) =>
    commentList.map((comment) => {
      const isThreadContinued = (comment.replies?.length || 0) > 2 && !expandedThreads[comment.id];
  
      return (
        <Box key={comment.id} sx={{ pl: depth * 4, mt: 2 }}>
          {/* Comment Wrapper (flex parent) */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, position: 'relative' }}>
            {/* Avatar */}
            <Avatar alt={comment.createdBy.name} src={comment.createdBy.avatarUrl} sx={{ width: 40, height: 40 }} />
  
            {/* Comment Content Wrapper */}
            <Box sx={{ flexGrow: 1 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'background.neutral',
                  boxShadow: 1,
                  borderRadius: 2,
                }}
              >
                {/* User Info and Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={500}>
                    @{comment.createdBy.name}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {fDate(comment.createdAt)}
                  </Typography>
                </Box>
  
                {/* Comment Content */}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {comment.content}
                </Typography>
              </Paper>
  
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 1, flexWrap: 'nowrap' }}>
                <Button
                  onClick={() => handleLike(comment.id)}
                  size="small"
                  startIcon={<Iconify icon="mdi:thumb-up-outline" />}
                  sx={{
                    textTransform: 'capitalize',
                    color: likes[comment.id] ? 'primary.main' : 'text.primary',
                  }}
                >
                  Like
                </Button>
                <Button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  size="small"
                  startIcon={<Iconify icon="mdi:reply-outline" />}
                  sx={{ textTransform: 'capitalize' }}
                >
                  Reply
                </Button>
                <Button
                  onClick={() => toggleReplyVisibility(comment.id)}
                  size="small"
                  startIcon={<Iconify icon="mdi:comments" />}
                  sx={{ textTransform: 'capitalize' }}
                  disabled={!comment.replies || comment.replies.length === 0}
                >
                  {comment.replies && comment.replies.length > 0
                    ? replyVisibility[comment.id]
                      ? 'Hide Comments'
                      : 'View Comments'
                    : 'No Comments'}
                </Button>
              </Box>
  
              {/* Reply Input */}
              {replyingTo === comment.id && (
                <Paper
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReplySubmit(comment.id);
                  }}
                  sx={{ mt: 2, p: 2 }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleUploadImage}>
                              <Iconify icon="mdi:image-outline" />
                            </IconButton>
                            <IconButton onClick={handleSelectEmoji}>
                              <Iconify icon="mdi:emoticon-outline" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button type="submit" size="small" variant="contained" sx={{mt:0.5}}>
                      Submit
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
  
          {/* Render Nested Replies */}
          {replyVisibility[comment.id] && comment.replies && (
            <Box sx={{ mt: 2 }}>
              {renderComments(isThreadContinued ? comment.replies.slice(0, 2) : comment.replies, depth + 1)}
              {isThreadContinued && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => handleExpandThread(comment.id)}
                  sx={{
                    mt: 2,
                    ml: 8,
                    typography: 'body2',
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <Iconify icon="mdi:chevron-down" sx={{ mr: 1, color: 'primary.main' }} />
                  Continue this Thread
                </Link>
              )}
            </Box>
          )}
        </Box>
      );
    });
  

  return (
    <>
  {/* Outer Box Container with Relative Position */}
  <Box sx={{ position: 'relative', minHeight: '500px' , }}>
    
    {/* Comment Writing Section */}
    <Box
      sx={{
        position: 'sticky', // Sticky positioning keeps it at the top while scrolling
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        zIndex: 10, // Ensures it stays above other content
        padding: 2, // Add padding for spacing
        borderRadius: 1, // Optional: Add border radius for rounded corners
      }}
    >
      <Avatar
        alt={currentEvent?.createdBy.name}
        src={currentEvent?.createdBy.avatarUrl}
        sx={{
          width: 40,
          height: 40,
          marginRight: 2, // Space between avatar and text field
        }}
      />

      {/* Text Input and Button */}
      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a Comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleUploadImage}>
                  <Iconify icon="mdi:image-outline" />
                </IconButton>
                <IconButton onClick={handleSelectEmoji}>
                  <Iconify icon="mdi:emoticon-outline" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.neutral',
              borderRadius: 1,
            },
            marginRight: 2, // Space between input and button
          }}
        />
        <Button
          type="submit"
          size="small"
          variant="contained"
          onClick={handleCommentSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>

    {/* Comment List Section */}
    <Box
      sx={{
        px: 2,
        pb: 2,
        bgcolor: 'background.paper',
        height:'350px',
        borderRadius: 2,
      }}
    >
      <Scrollbar sx={{ height: '100%' }}>
        {renderComments(currentComments)}

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(comments.length / commentsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Scrollbar>
    </Box>
  </Box>
</>


  );
}
