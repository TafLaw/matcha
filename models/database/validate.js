class user{
    function(password, confirmPass){
        if (confirmPass === password)
            return true
        return false;
    }
}