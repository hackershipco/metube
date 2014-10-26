class Video < ActiveRecord::Base
  # attr_accessible :link

  private

    def video_params
      params.require(:video).permit(:link)
    end

end
