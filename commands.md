

To create the video model :

```shell
rails g model Video link:string title:string author:string duration:string likes:integer dislikes:integer

rake db:migrate
```