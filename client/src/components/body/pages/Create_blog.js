import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import NotFound from "../../utils/NotFound/NotFound";
import CardHoriz from "../blog/card/CardHoriz";
import CreateForm from "../blog/card/CreateForm";
import axios from "axios";
import ReactQuill from "../editor/ReactQuill";
import Loading from "../../utils/notification/Loading";
import {
  showSuccessMsg,
  showErrMsg,
} from "../../utils/notification/Notification";
import {
  isEmpty,
  isTitle,
  isContent,
  isDescription,
  isCoverImage,
  isCategory,
} from "../../utils/validation/Validation";
const initialState = {
  title: "",
  content: "",
  description: "",
  links: "",
  reletedTo: "",
  createdAt: new Date().toISOString(),
  err: "",
  success: "",
};
const Create_blog = () => {
  const [blog, setBlog] = useState(initialState);
  const [body, setBody] = useState("");
  const [text, setText] = useState("");
  const [oldData, setOldData] = useState(initialState);

  const [callback, setCallback] = useState(false);
  const [coverImage, setCoverImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.token);

  const auth = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const divRef = useRef(null);

  const dispatch = useDispatch();

  const { title, content, description, reletedTo, links, err, success } = blog;

  useEffect(() => {
    const getCategories = async () => {
      const res = await axios.get("/api/category");
      setCategories(res.data);
    };

    getCategories();
  }, [callback]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setBlog({ ...blog, [name]: value });
  };

  const handleChangeThumbnail = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];

      if (!file)
        return setBlog({
          ...blog,
          err: "No files were uploaded.",
          success: "",
        });

      if (file.size > 1024 * 1024)
        return setBlog({ ...blog, err: "Size too large.", success: "" });

      if (file.type !== "image/jpeg" && file.type !== "image/png")
        return setBlog({
          ...blog,
          err: "File format is incorrect.",
          success: "",
        });

      let formData = new FormData();
      formData.append("file", file);

      setLoading(true);
      const res = await axios.post("/api/upload_coverImage", formData, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: token,
        },
      });

      setLoading(false);
      setCoverImage(res.data.url);
    } catch (err) {
      setBlog({ ...blog, err: err.response.data.msg, success: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmpty(title) || isEmpty(description))
      return setBlog({
        ...blog,
        err: "Please fill in all fields.",
        success: "",
      });

    if (!isTitle(title))
      return setBlog({
        ...blog,
        err: "Title must be at least 10 characters.",
        success: "",
      });

    if (!isContent(content))
      return setBlog({
        ...blog,
        err: "Content must be at least 2000 characters.",
        success: "",
      });

    if (!isDescription(description))
      return setBlog({
        ...blog,
        err: "Content must be at least 2000 characters.",
        success: "",
      });

    // if (isThumbnail)
    //   return setBlog({
    //     ...blog,
    //     err: "Thumbnail cannot be left blank.",
    //     success: "",
    //   });
    if (isCategory)
      return setBlog({
        ...blog,
        err: "Category cannot be left blank.",
        success: "",
      });

    try {
      const res = await axios.post(
        "/blogs/postBlog",
        {
          title,
          content,
          description,
          links,
          coverImage,
          reletedTo,
        },
        {
          headers: { Authorization: token },
        }
      );

      setBlog({ ...blog, err: "", success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setBlog({ ...blog, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="create_blog">
      <div className="blog_pro">
      {err && showErrMsg(err)}
          {success && showSuccessMsg(success)}
          {loading && <Loading />}
        <h1>Create_blog</h1>
        <div className="row">
          <div className="col-md-6">
            <h5>Create</h5>
            {/* <CreateForm blog={blog} setBlog={setBlog} /> */}
            <div className="form-group position-relative">
              <input
                type="text"
                className="form-control"
                value={title}
                name="title"
                onChange={handleChangeInput}
              />

              <small
                className="text-muted position-absolute"
                style={{ bottom: 0, right: "3px", opacity: "0.3" }}
              >
                {title.length}/50
              </small>
            </div>

            <div className="form-group my-3">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleChangeThumbnail}
                name="coverImage"
              />
            </div>

            <div className="form-group position-relative">
              <textarea
                className="form-control"
                rows={4}
                value={description}
                style={{ resize: "none" }}
                name="description"
                onChange={handleChangeInput}
              />

              <small
                className="text-muted position-absolute"
                style={{ bottom: 0, right: "3px", opacity: "0.3" }}
              >
                {description.length}/200
              </small>
            </div>

            <div className="form-group my-3">
              <select
                className="form-control text-capitalize"
                value={reletedTo}
                name="reletedTo"
                onChange={handleChangeInput}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* <div className="line-2">
            <hr></hr>
          </div> */}
          <div className="col-md-6">
            <h5>Preview</h5>
            <CardHoriz blog={blog} />
          </div>
        </div>
        <ReactQuill setBody={setBody} body={body} />
        <button
          className="blog_post_btn mt-3 d-block mx-auto"
          onClick={handleSubmit}
        >
          Create Post
        </button>
      </div>
    </div>
  );
};

export default Create_blog;