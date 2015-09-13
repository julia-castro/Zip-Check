get '/zipcheck' do
  @zip = params["zip_code"]
  erb :index
end

get '/map' do
  erb :map
end

