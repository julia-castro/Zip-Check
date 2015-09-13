source 'https://rubygems.org'
ruby '2.2.1'

# PostgreSQL driver
gem 'pg'

# Sinatra driver
gem 'sinatra', git: 'git@github.com:sinatra/sinatra.git'
gem 'sinatra-contrib'

gem 'activesupport', '~>4.2.0'
gem 'activerecord', '~>4.2.0'

gem 'rake'

gem 'shotgun'

group :test do
  gem 'shoulda-matchers'
  gem 'rack-test'
  gem 'rspec', '~>3.0'
  gem 'capybara'
end

group :test, :development do
  gem 'factory_girl'
  gem 'faker'
end
