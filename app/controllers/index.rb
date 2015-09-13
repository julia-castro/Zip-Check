get '/' do
  @zip = params["zip_code"]
  erb :index
end

get '/users' do
  users = User.all()

  return users.to_json

  # show all users, redirect to map with users on it
end

get '/users/add' do
  name = params["user"]
  email = params["email"]
  text = params["text"]

  user = User.create(first_name: name, prevention_method: text, email: email)

  return "ok"
end
