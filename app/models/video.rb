class Video < ActiveRecord::Base
  attr_accessible :link
  params.require(:video).permit(:link)
end
