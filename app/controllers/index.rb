get '/' do
  @zip = params["zip_code"]
  erb :index
end
