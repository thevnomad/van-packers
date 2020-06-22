const Campground = require("./models/campground");
const Comment = require("./models/comment");

const seeds = [
  // When we have an array, we should call it something plural
  {
    name: "Grand Canyon",
    image:
      "https://images.unsplash.com/photo-1447958272669-9c562446304f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    author: "Charlie",
  },
  {
    name: "Atacama Desert",
    image:
      "https://images.unsplash.com/photo-1510689065053-5cae1df31d38?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    author: "Brown",
  },
  {
    name: "Moraine Lake",
    image:
      "https://images.unsplash.com/photo-1587393411987-594c78cd0ac4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    author: "Snoopy",
  },
];

async function seedDB() {
  try {
    // Remove all comments
    await Comment.deleteMany({});
    console.log("Comments removed!");
    // Remove all campgrounds
    await Campground.deleteMany({});
    console.log("Campgrounds removed!");

    for (const seed of seeds) {
      // for each "seed" inside of "seeds" do something
      // Create Campground
      let campground = await Campground.create(seed);
      console.log("Campgrounds created!");

      // Create a comment
      let comment = await Comment.create({
        text: "This place is great, but I wish there was internet",
        author: "Homer",
      });
      console.log("Comment created!");
      campground.comments.push(comment);
      campground.save();
      console.log("Comment added to Campground!");
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = seedDB;
