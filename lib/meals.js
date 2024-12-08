// this file fetch meals in db
import sql from "better-sqlite3";

// to automatically generate a slug from the meal title
import slugify from "slugify";

// // to protected from cross-site scripts attack, as we are using that function 'dangerouslySetInnerHTML'
import xss from "xss";

// // to handle with file system
import fs from "node:fs";

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // artificial delay
  //   throw new Error("This is an artificial Error while fetching meals");
  return db.prepare("SELECT * FROM meals").all();
}

export async function getMeal(slug) {
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // artificial delay

  // Using '.get(var) in order to avoid Sql Injection
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  // generating the slug from the title
  meal.slug = slugify(meal.title, { lower: true });

  // cleaning instructions data to avoid malicious scripts
  meal.instructions = xss(meal.instructions);

  // handling the Image to save in file system (/public/images)
  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;
  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();
  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Saving image failed!");
    }
  });
  meal.image = `/images/${fileName}`;

  // inserting data into DB
  db.prepare(
    `
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
    `
  ).run(meal);
}
