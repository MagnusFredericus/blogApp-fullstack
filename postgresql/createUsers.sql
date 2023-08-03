--DROP USER IF EXISTS app;
CREATE USER app WITH PASSWORD 'password';

\c app;

GRANT SELECT,
    INSERT (id, name, last_name, email, bio, password, refresh_token),
    UPDATE (name, last_name, email, bio, password, refresh_token),
    DELETE,
    REFERENCES
    ON users
    TO app;
GRANT USAGE ON SEQUENCE users_id_seq TO app;

GRANT SELECT,
    INSERT (id, user_id, title, content, views, likes),
    UPDATE (user_id, title, content, views, likes),
    DELETE,
    REFERENCES
    ON posts
    TO app;
GRANT USAGE ON SEQUENCE posts_id_seq TO app;

GRANT SELECT,
    INSERT (id, user_id, post_id, content, author, likes),
    UPDATE (user_id, post_id, content, likes),
    DELETE,
    REFERENCES
    ON comments
    To app;
GRANT USAGE ON SEQUENCE comments_id_seq TO app;

GRANT SELECT,
    INSERT (user_id, invited_id),
    UPDATE (user_id, invited_id),
    DELETE,
    REFERENCES
    ON friendship_invitations
    TO app;

GRANT SELECT,
    INSERT (user_id, friend_id),
    UPDATE (user_id, friend_id),
    DELETE,
    REFERENCES
    ON friendships
    TO app;


GRANT SELECT,
    INSERT (user_id, post_id),
    UPDATE (user_id, post_id),
    DELETE,
    REFERENCES
    ON posts_likes
    TO app;

GRANT SELECT,
    INSERT (user_id, comment_id),
    UPDATE (user_id, comment_id),
    DELETE,
    REFERENCES
    ON comments_likes
    TO app;