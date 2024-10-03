import React, { useEffect, useState, useContext } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import PostItem from "../PostItem/PostItem";
import { loadPosts } from "../../data/fetch";
import { UserContext } from "../../context/UserContextProvider";
import "./PostList.css";

const PostList = () => {
  const { token } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set()); // Traccia i post che sono stati messi like
  const [search, setSearch] = useState("");
  const [aggiornaPostList, setAggiornaPostList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts(search, currentPage).then((data) => {
      setPosts(data.dati);
      setTotalPages(data.totalPages);
    });
  }, [search, currentPage, aggiornaPostList]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLike = (postId) => {
    if (!likedPosts.has(postId)) {
      setLikedPosts(prev => new Set(prev).add(postId)); // Aggiungi il post agli likedPosts
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
      ));
    }
  };

  return (
    <>
      <Row>
        {posts.map((post, i) => (
          <Col
            key={`item-${i}`}
            md={12}
            style={{
              marginBottom: 50
            }}
          >
            <PostItem
              key={post._id}
              {...post}
              setAggiornaPostList={setAggiornaPostList}
              aggiornaPostList={aggiornaPostList}
              onLike={() => handleLike(post._id)}
              liked={likedPosts.has(post._id)} // Passa lo stato del like
            />
          </Col>
        ))}
      </Row>
      <div className="pagination-controls">
        <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </>
  );
};

export default PostList;
