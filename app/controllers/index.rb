get '/zipcheck' do
  @zip = params["zip_code"]
  erb :index
end

# post '/zipcheck_result' do
#   p params
#   erb :result
# end