get '/' do
  @zip = params["zip_code"]
  erb :index
end

get '/users' do
  erb:
  # show all users, redirect to map with users on it
end

post '/users' do
  User.create(params["user"])
  #show all users, redirect to map with users on it
end
