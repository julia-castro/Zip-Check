class User < ActiveRecord::Base
  belongs_to :location
  validates :first_name, presence: true
  validates :prevention_method, presence: true
  validates_format_of :email, with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i, on: :create
end
