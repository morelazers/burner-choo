pragma solidity ^0.5.7;

contract TOKEN{

    function transfer(address _to, uint amount, bytes memory data) public {

    }

    address _regatta;
    Regatta regatta;

    function set_regatta(address reg) public{
        _regatta = reg;
        regatta = Regatta(reg);
    }

    function just_enter_next(uint block_finish_last, uint8 class, uint8 variant, bool repellent) public {
        bytes memory data = abi.encode(block_finish_last, class, variant, repellent);
        regatta.tokenFallback(msg.sender, 0, data);
    }
}

contract Regatta {

    //Flex Magic
    function tokenFallback( address from, uint256 value, bytes calldata data) external{
        require(msg.sender == fb,"sender");

        (uint block_finish_last, uint8 class, uint8 variant, bool repellent) = abi.decode(data, (uint, uint8, uint8, bool));

        just_enter_next(from, value, block_finish_last, class, variant, repellent);
    }



    event Declare(uint race_number);
    event Enter(uint race_number, address entrant, uint8 class, uint8 variant, bool repellent);

    event Void(uint race_number, address judge);
    event Finish(uint race_number, uint block_finish, address judge);
    event Rename(address boat, bytes32 name);
    event CashOut(address winner);

    struct Race {
        uint pool;

        uint block_start;
        uint block_finish;

        Boat[10] boats;

        uint boat_count;
    }

    struct Boat {
        address owner;
        uint8 class;
        uint8 variant;
        bool repellent;
    }


    mapping(address => uint) bank;
    mapping(address => bytes32) boat_names;
    mapping(uint => Race) races;

    address blackbeard;
    function mutiny(address new_beard) external{
        require(msg.sender == blackbeard,"impostor");
        blackbeard = new_beard;
    }

    uint race_number;
    uint constant COURSE_LENGTH = 50; //constant

    uint constant PRICE_REPELLENT = 10; //%
    uint[3] PRICE_CLASS = [
    300,     // SET
    500,     // THESE
    700       // VALUES
    ];


    uint[3] MULTIPLIER_CLASS = [
    100, //%
    110, //%
    120 //%
    ];
    uint constant MULTIPLIER_VARIANT = 2;

    uint constant TIME_WAIT = 3;

    uint constant public MODULO_SQUID = 3;


    TOKEN flexbuxx;
    address fb;
    constructor(address _fb) public{
        fb = _fb;
        flexbuxx = TOKEN(_fb);
        blackbeard = msg.sender;
    }

    function calculate_fee(uint8 class, bool repellent) internal view returns(uint){
        if(repellent){
            return PRICE_CLASS[class] * (100 + PRICE_REPELLENT) / 100;
        }else{
            return PRICE_CLASS[class];
        }

    }


    //x
    function declare_race(address player, uint payment, uint8 class, uint8 variant, bool repellent) internal{
        if(!check_race_finished() ||
        (
        races[race_number].block_start == 0 &&
        races[race_number].boat_count == 2
        )
        ){
            enter_race(player, payment, class,variant,repellent);
            return;
        }

        require(class < 3,"class");
        uint fee = calculate_fee(class,repellent);
        require( payment == fee, "payment");
        require(variant < 3,"variant");

        race_number++;

        races[race_number].boat_count = 2;
        races[race_number].boats[0] = Boat(player,class,variant,repellent);
        races[race_number].pool += calculate_fee(class,false);

        emit Declare(race_number);
        emit Enter(race_number, player, class, variant, repellent);
    }
    //x
    function enter_race(address player, uint payment, uint8 class, uint8 variant, bool repellent) internal {
        require(class < 3,"class");
        uint fee = calculate_fee(class,repellent);
        require( payment == fee, "payment");
        require(variant < 3,"variant");

        require(!check_race_started(),"started");
        require(!check_race_finished(),"finished");

        require(races[race_number].boat_count < 10,"full");
        require(race_number > 0,"undelcared");

        if(races[race_number].block_start == 0){
            races[race_number].block_start = block.number + TIME_WAIT;
            races[race_number].boats[1] = Boat(player,class,variant,repellent);
        }else{
            races[race_number].boats[
            races[race_number].boat_count
            ] = Boat(player,class,variant,repellent);
            races[race_number].boat_count++;
        }
        races[race_number].pool += calculate_fee(class,false);

        emit Enter(race_number, player, class, variant, repellent);

    }

    function check_race_finished() view internal returns(bool){
        if(race_number == 0){
            return true;
        }else{
            return races[race_number].block_finish != 0;
        }
    }
    function check_race_started() view internal returns(bool){
        return races[ race_number ].block_start != 0 &&
        races[ race_number ].block_start < block.number;
    }
    function increment_boat(uint hash, uint weather, uint boatNum, uint8 class, uint variant) internal view returns(uint){
        uint increment = uint(keccak256(abi.encodePacked(boatNum,hash)))%10 * MULTIPLIER_CLASS[class]/100;
        if(weather == variant){
            increment *= MULTIPLIER_VARIANT;
        }
        return increment;
    }


    function get_pool() external view returns(uint){
        return races[race_number].pool;
    }

    //x
    function get_race_number() public view returns (uint){
        return race_number;
    }
    //x
    function get_weather() public view returns (uint){

        uint hash = uint(blockhash(block.number - 1));
        return  hash%3;
    }
    //x
    function get_progress() public view  returns (uint[10] memory progress, uint block_finish, uint weather, uint squid){
        if(races[race_number].block_start == 0){
            return (progress, block_finish, 0, 11);
        }

        squid = 11;
        uint leader;
        for(uint b = races[race_number].block_start; b < block.number; b++){
            uint hash = uint(blockhash(b));
            weather = hash%3;
            for(uint boat = 0; boat < races[race_number].boat_count; boat++){
                if(squid != boat){
                    progress[boat] += increment_boat(
                        hash,
                        weather,
                        boat,
                        races[race_number].boats[boat].class,
                        races[race_number].boats[boat].variant
                    );
                }
                if(progress[boat] >= progress[leader]){
                    leader = boat;
                }
                if(progress[boat] >= COURSE_LENGTH ){
                    block_finish = b;
                }
            }

            if(block_finish != 0){
                break;
            }
            if(
                progress[leader] < COURSE_LENGTH
                && progress[leader] > COURSE_LENGTH/2
                && !races[race_number].boats[leader].repellent
            && squid == 11
            && hash%MODULO_SQUID == 0
            ){
                squid =  leader;
            }
        }


        return (progress, block_finish, uint(blockhash(block.number - 1))%3, squid);
    }
    //x
    function get_times() public view returns (uint block_start, uint block_finish, uint block_current){
        return (
        races[race_number].block_start,
        races[race_number].block_finish,
        block.number
        );
    }

    //x
    function get_boats() public view returns (
        address[10] memory owner,
        uint8[10] memory class,
        uint8[10] memory variant,
        bool[10] memory repellent
    ){
        for(uint boat = 0; boat < 10; boat++){
            owner[boat] = races[race_number].boats[boat].owner;
            class[boat] = races[race_number].boats[boat].class;
            variant[boat] = races[race_number].boats[boat].variant;
            repellent[boat] = races[race_number].boats[boat].repellent;
        }
        return (owner,class,variant,repellent);
    }

    //x
    function get_name(address boat) public view returns(bytes32 name){
        return boat_names[boat];
    }
    //x
    function get_balance() public view returns(uint balance){
        return bank[msg.sender];
    }
    //x
    function get_boat_count() public view returns(uint boat_count){
        return races[race_number].boat_count;
    }

    function do_declare_finish(address player, uint block_finish) internal {
        uint squid = 11;
        uint leader;
        uint[10] memory progress;
        uint winners;

        bool finished;


        for(uint b = races[race_number].block_start; b <= block_finish; b++){
            uint hash = uint(blockhash(b));
            uint weather = hash%3;
            for(uint boat = 0; boat < races[race_number].boat_count; boat++){
                if(squid != boat){
                    progress[boat] += increment_boat(
                        hash,
                        weather,
                        boat,
                        races[race_number].boats[boat].class,
                        races[race_number].boats[boat].variant
                    );
                }
                if(progress[boat] >= progress[leader]){
                    leader = boat;
                }

                if(b == block_finish - 1){
                    require(progress[boat] < COURSE_LENGTH,"passed");
                }else if(b == block_finish){
                    finished = finished || progress[boat] >= COURSE_LENGTH;
                    if(progress[boat] >= COURSE_LENGTH){
                        winners++;
                    }
                }
            }
            if(progress[leader] < COURSE_LENGTH && progress[leader] > COURSE_LENGTH/2 && !races[race_number].boats[leader].repellent && squid == 11 &&  uint(hash)%MODULO_SQUID == 0){
                squid =  leader;
            }
        }

        require(finished,"unfinished");
        races[race_number].block_finish = block_finish;

        uint paid = 0;
        uint reward = races[race_number].pool / winners * 95/100;
        for( uint boat = 0; boat < races[race_number].boat_count; boat++){
            if(progress[boat] >= COURSE_LENGTH){
                bank[
                races[race_number].boats[boat].owner
                ] += reward;

                paid += reward;
            }
        }
        bank[ player ] += reward * 25/1000;
        paid +=  reward * 25/1000;

        bank[ blackbeard ] += races[race_number].pool - paid;


        emit Finish(race_number, block_finish, player);
    }


    function declare_finish(uint block_finish) external {
        require(races[race_number].block_start != 0,"unstarted");
        require(block_finish < block.number, "undetermined");
        require(block.number <= races[race_number].block_start + 256,"void");

        if( races[race_number].block_finish != 0 ){
            //Fallback and just withdraw that shit
            uint balance = bank[msg.sender];
            require(balance > 0, "finished");
            bank[msg.sender] = 0;
            flexbuxx.transfer(msg.sender, balance, "0x");
            emit CashOut( msg.sender );
            return;
        }

        do_declare_finish(msg.sender, block_finish);


        uint balance = bank[msg.sender];
        if(balance > 0){
            bank[msg.sender] = 0;
        }

        flexbuxx.transfer(msg.sender, balance, "0x");
    }



    function rename_boat(bytes32 name) external {
        boat_names[msg.sender] = name;
        emit Rename(msg.sender,name);
    }

    function grab_gold() public {
        uint balance = bank[msg.sender];
        require(balance > 0,"broke");
        bank[msg.sender] = 0;

        flexbuxx.transfer(msg.sender, balance, "0x");
        emit CashOut(msg.sender);
    }


    function just_enter_next(address player, uint payment, uint block_finish_last,uint8 class, uint8 variant, bool repellent) internal {
        if(
            block_finish_last != 0
            &&
            races[race_number].block_start != 0
            &&
            races[race_number].block_finish == 0
        &&
        block_finish_last > races[race_number].block_start
        ){
            //Attempt to finish last, put reward in bank
            do_declare_finish(player, block_finish_last);
        }

        declare_race(player, payment, class,variant,repellent);
    }
}