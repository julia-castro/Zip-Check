class Location < ActiveRecord::Base
  has_many :users
  validates :latitude, presence: true
  validates :longitude, presence: true
end