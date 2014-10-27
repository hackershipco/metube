Hi, during this class we will create a Rails application that will allow us to add YouTube videos, we're calling it [mitube](https://github.com/hackershipco/metube) we will be using the YouTube Api, regular expressions a lot of JavaScript and some more advanced options that we haven't looked into before.

We will allow to add comments with [disqus](https://disqus.com/).

We will be working in pairs, lets try and organize so the more confident people in class sit with those that are still unsure about the concepts and procedures. The most 'advanced' of the two will be doing the research mostly and dictating, work as a team but do one project per group.

I have a [finished version](https://github.com/hackershipco/metube/commits/master) but only look at it when you're stuck or when you want to compare. We will use a similar approach to the blog you created, creating an application, generating the models, and doing one by one the controllers and views. The more applications you create the more familiar you will be with the process to soon be creating your own apps.

Preparation
---

We will be using the [youtube_it gem](https://github.com/kylejginavan/youtube_it).

You will need a [Youtube](https://youtube.com) account.

Register an application in the [Google Console](https://code.google.com/apis/console/b/0/?pli=1)

Setting up
---

Create a Rails application called mitube.

Set up a repository in your github and remember to push frequently, you can do it after every step.

Add the following gems to your application
```ruby
gem 'bootstrap-sass', '~> 3.1.1.0'
gem 'youtube_it', '~> 2.4.0'
```

Change the Sqlite gem to be only in the development group, add the postgres gem to your production group.

Remove the turbolink gem and the references to it in app/assets/application.js.

Include bootstrap in your application.js  `//= require bootstrap` and appication.css.scss `@import "bootstrap";`.


Creating the video model
---

We need a model to store the information of our videos, their structure, and perform common operations in the data from the user, like make sure is a valid url.

YouTube will give us a lot of information, but for our application it might be enough with:

* **id** – integer, primary key, indexed, unique
* **link** – string
* **uid** – string. It is also a good idea to add an index here to enforce uniqueness. For this demo, we don’t want users to add the same videos multiple times, the video identifier from YouTube
* **title** – string. This will contain the video’s title extracted from YouTube
* **author** – string. Author’s name extracted from YouTube
* **duration** – string. We will store the video’s duration, formatted like so: “00:00:00″
* **likes** – integer. Likes count for a video
* **dislikes** – integer. Dislikes count for a video.

Create the model using the generator, when you create a model you don't need to add the id.

**Reminder of the syntax** `rails g model Video [field]:[datatype]`

Run the migrations after that.

**Securing the model** By default all the properties of the model are public, the users here will only add the link and we will infer the rest, so go to your model and add:

```ruby
  # attr_accessible :link
```

**Note** In rails 4 attr_accessible [is not longer used](https://stackoverflow.com/questions/23437830/undefined-method-attr-accessible).

Creating the routes
---

We will use the resources for the video and set the root to 'videos#index'.

Resources by default creates index, new, create, edit, update, show and destroy. Since we don't need all of them we can tweak that line.

```ruby
resources :videos, only: [:index, :new, :create]
```

In the main layout file, lets add a space for the flash messages to show.

```html
<div class="container">
  <% flash.each do |key, value| %>
    <div class="alert alert-<%= key %>">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <%= value %>
    </div>
  <% end %>
</div>
```

Create a videos_controller.rb with an empty index action, and the index view in /app/views/videos/index.html.erb. The index view could have a link to `new_video_path` for now.

Actions for the controller
---

In the videos_controller lets add the two functions we need so the visitors can add videos into the application.

```ruby
def new
  @video = Video.new
end

def create
  @video = Video.new(video_params)
  if @video.save
    flash[:success] = 'Video added!'
    redirect_to root_url
  else
    render 'new'
  end
end

def video_params
  params.require(:video).permit(:link)
end
```

Nothing special yet, just similar functions to what we have seen before.

And lets create a view in videos/new.html.erb with a form to submit the information.

```html
<div class="container">
  <h1>New video</h1>

  <%= form_for @video do |f| %>
    <%= render 'shared/errors', object: @video %>

    <div class="form-group">
      <%= f.label :link, 'Video Url' %>
      <%= f.text_field :link, class: 'form-control', required: true %>
      <span class="help-block">A link to the video on YouTube.</span>
    </div>

    <%= f.submit class: 'btn btn-default' %>
  <% end %>
</div>
```

Again, same forms we have created before. Note in the f.label, I'm calling that function with a second parameter to change the label that the input will have, go ahead and customize this HTML to make it yours.

That `f ` helper and its functions can receive a few other parameters to personalize the way they will render, the most used one is `:class 'someclass'` that we're using so the resulting HTML takes advantage of the bootstrap CSS.


In that new view we ask to render a errors partial, create it at `views/shared/_errors.html.erb`.
```erb
<% if object.errors.any? %>
  <div class="panel panel-danger">
    <div class="panel-heading">
      <h3 class="panel-title">The following errors were found while submitting the form:</h3>
    </div>

    <div class="panel-body">
      <ul>
        <% object.errors.full_messages.each do |msg| %>
          <li><%= msg %></li>
        <% end %>
      </ul>
    </div>
  </div>
<% end %>
```
We're passing the video model to it, it will check if there are validator errors and display them there for the user.

Up to here you should have a form to add videos that should be working. Make sure of that before continuing.

Validating data
---

When the user submits a video we need to make sure is really a YouTube url, this is important because we will fetch information from YouTube later and our application will depend on that information being precise.

In our video model we will create a function called
```ruby
before_create -> do
  # Our code here
end
```
This will get called before the object is saved in the database, we can perform verifications and alter the data if necessary.

We will use Regular Expressions to check the [YouTube video id](https://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url).

**Regular Expressions** is a fascinating subject and one that can be very important, if you want to practice or get better at them [Regex101](http://regex101.com/) is a perfect place. is a special text string for describing a search pattern. You can think of regular expressions as wildcards on steroids. You are probably familiar with wildcard notations such as `*.txt` to find all text files in a file manager. The regex equivalent is ` .*\.txt `. [source](http://www.regular-expressions.info/).

```ruby
YT_LINK_FORMAT = /\A.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/i
 
validates :link, presence: true, format: YT_LINK_FORMAT
```

We will add that to the model function, and our before_create function will be :

```ruby
before_create -> do
  uid = link.match(YT_LINK_FORMAT)
  self.uid = uid[2] if uid && uid[2]

  if self.uid.to_s.length != 11
    self.errors.add(:link, 'is invalid.')
    false
  elsif Video.where(uid: self.uid).any?
    self.errors.add(:link, 'is not unique.')
    false
  else
    get_additional_info
  end
end
```
In that function we extract the video Id from the url and we make sure that the video is unique and not repeated in the database.

