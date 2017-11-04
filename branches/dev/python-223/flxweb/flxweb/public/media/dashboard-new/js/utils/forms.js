export const hasError = ({touched, error}) => {
    return !!touched && !!error;
};