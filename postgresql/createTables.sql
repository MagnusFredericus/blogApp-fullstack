\c app;

--DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

--DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

--DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

--DROP TABLE IF EXISTS friendship_invitations CASCADE;
CREATE TABLE friendship_invitations (
    PRIMARY KEY(user_id, invited_id),
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    invited_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

--DROP TABLE IF EXISTS friendships CASCADE;
CREATE TABLE friendships (
    PRIMARY KEY(user_id, friend_id),
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

--DROP TABLE IF EXISTS posts_likes CASCADE;
CREATE TABLE posts_likes (
    PRIMARY KEY(user_id, post_id),
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

--DROP TABLE IF EXISTS comments_likes CASCADE;
CREATE TABLE comments_likes (
    PRIMARY KEY(user_id, comment_id),
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Trigger definition
CREATE OR REPLACE FUNCTION updated_at() RETURNS trigger AS $update_at$
BEGIN
    NEW.updated_at = current_timestamp;
    RETURN NEW;
END
$update_at$ LANGUAGE plpgsql;

-- Add the trigger to all tables that have a 'updated_at' column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name='updated_at'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER updated_at BEFORE INSERT OR UPDATE ON %I
            FOR EACH ROW EXECUTE PROCEDURE updated_at()', t, t
        );
    END LOOP;
END
$$ LANGUAGE plpgsql;