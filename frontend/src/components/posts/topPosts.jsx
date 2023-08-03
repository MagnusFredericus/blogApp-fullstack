import { Link } from "react-router-dom";
import './topPosts.css'

function TopPosts({ topPosts }) {
    return (
        <div className="topPosts">
            <h3>Most read</h3>
            {
                topPosts.map((post, index) => {
                    return (
                        <Link 
                            key={ post.id }
                            to={'/posts/' + post.id} >
                            <p 
                                key={ post.id }>
                                { index+1 } - { post.title }
                            </p>
                        </Link>
                        )
                })
            }
        </div>
    )
}

export default TopPosts;